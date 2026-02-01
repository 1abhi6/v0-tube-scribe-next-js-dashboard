"use server";

export type GenerationStep =
  | "idle"
  | "fetching"
  | "summarizing"
  | "formatting"
  | "complete";

export interface GenerationResult {
  success: boolean;
  markdown: string;
  error?: string;
  wordCount?: number;
  readingTime?: number;
}

/**
 * Extracts YouTube video ID from various URL formats
 */
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Validates if URL is a valid YouTube link
 */
function isValidYouTubeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const validHosts = [
      "youtube.com",
      "www.youtube.com",
      "youtu.be",
      "m.youtube.com",
    ];
    return validHosts.some(
      (host) => urlObj.hostname === host || urlObj.hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}

/**
 * Method 1: Fetch transcript using Supadata API
 * Free tier: 100 requests/month
 * Docs: https://docs.supadata.ai/
 */
async function fetchWithSupadataAPI(
  videoId: string
): Promise<{ text: string; error?: string }> {
  const apiKey = process.env.SUPADATA_API_KEY;
  
  if (!apiKey) {
    return { text: "", error: "SUPADATA_API_KEY not configured" };
  }

  try {
    // Try without text=true first to get the full response
    const response = await fetch(
      `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}`,
      {
        headers: {
          "x-api-key": apiKey,
        },
      }
    );

    console.log("[v0] Supadata response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("[v0] Supadata error response:", errorText);
      return { 
        text: "", 
        error: `Supadata API error: ${response.status}` 
      };
    }

    const data = await response.json();
    console.log("[v0] Supadata response keys:", Object.keys(data));
    
    let fullText = "";
    
    // Handle different response formats
    if (typeof data === "string") {
      fullText = data;
    } else if (data.transcript) {
      fullText = data.transcript;
    } else if (data.text) {
      fullText = data.text;
    } else if (data.content && Array.isArray(data.content)) {
      fullText = data.content.map((item: { text: string }) => item.text).join(" ");
    } else if (Array.isArray(data)) {
      fullText = data.map((item: { text?: string }) => item.text || "").join(" ");
    }

    if (!fullText) {
      console.log("[v0] Supadata data structure:", JSON.stringify(data).slice(0, 500));
      return { text: "", error: "No transcript content in response" };
    }

    return { text: fullText.slice(0, 10000) };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { text: "", error: `Supadata API failed: ${msg}` };
  }
}

/**
 * Method 1b: Try Kome.ai free transcript API (no auth required)
 */
async function fetchWithKomeAPI(
  videoId: string
): Promise<{ text: string; error?: string }> {
  try {
    const response = await fetch(
      `https://kome.ai/api/tools/youtube-transcript?url=https://www.youtube.com/watch?v=${videoId}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      return { text: "", error: `Kome API error: ${response.status}` };
    }

    const data = await response.json();
    
    let fullText = "";
    if (data.transcript) {
      fullText = data.transcript;
    } else if (data.text) {
      fullText = data.text;
    } else if (Array.isArray(data)) {
      fullText = data.map((item: { text?: string }) => item.text || "").join(" ");
    }

    if (!fullText) {
      return { text: "", error: "No transcript from Kome API" };
    }

    return { text: fullText.slice(0, 10000) };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { text: "", error: `Kome API failed: ${msg}` };
  }
}

/**
 * Method 2: Fetch transcript using youtube-captions-scraper (Algolia)
 */
async function fetchWithCaptionsScraper(
  videoId: string
): Promise<{ text: string; error?: string }> {
  try {
    const { getSubtitles } = await import("youtube-captions-scraper");

    // Try English first, then auto-generated
    const languages = ["en", "en-US", "en-GB", "a.en"];

    for (const lang of languages) {
      try {
        const captions = await getSubtitles({
          videoID: videoId,
          lang: lang,
        });

        if (captions && captions.length > 0) {
          const fullText = captions.map((c: { text: string }) => c.text).join(" ");
          return { text: fullText.slice(0, 10000) };
        }
      } catch {
        // Try next language
        continue;
      }
    }

    return { text: "", error: "No captions found with scraper" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { text: "", error: `Scraper failed: ${msg}` };
  }
}

/**
 * Method 2: Direct YouTube page scraping with improved parsing
 */
async function fetchWithDirectScraping(
  videoId: string
): Promise<{ text: string; error?: string }> {
  try {
    console.log("[v0] Fetching YouTube page for video:", videoId);
    
    // Fetch the video page
    const response = await fetch(
      `https://www.youtube.com/watch?v=${videoId}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        },
      }
    );

    if (!response.ok) {
      console.log("[v0] Failed to fetch page, status:", response.status);
      return { text: "", error: `Failed to fetch video page: ${response.status}` };
    }

    const html = await response.text();
    console.log("[v0] Page fetched, length:", html.length);

    // Check for bot detection
    if (html.includes("Sign in to confirm") || html.includes("unusual traffic")) {
      console.log("[v0] Bot detection triggered");
      return { text: "", error: "YouTube requires verification" };
    }

    // Try multiple patterns to find caption data
    const patterns = [
      /"captionTracks":\s*(\[[\s\S]*?\])(?=,\s*")/,
      /captionTracks":\s*(\[.*?\])/,
      /"captions":\s*\{[^}]*"playerCaptionsTracklistRenderer":\s*\{[^}]*"captionTracks":\s*(\[.*?\])/,
    ];

    let captionTracks = null;
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        try {
          // Clean the JSON string
          let jsonStr = match[1];
          // Fix common JSON issues
          jsonStr = jsonStr.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
          captionTracks = JSON.parse(jsonStr);
          console.log("[v0] Found caption tracks:", captionTracks.length);
          break;
        } catch (e) {
          console.log("[v0] Failed to parse with pattern, trying next");
          continue;
        }
      }
    }

    if (!captionTracks || captionTracks.length === 0) {
      // Check if video exists but has no captions
      if (html.includes('"playabilityStatus"')) {
        console.log("[v0] Video exists but no caption tracks found");
        return { text: "", error: "No captions available for this video" };
      }
      return { text: "", error: "Could not find caption data" };
    }

    // Find the best caption track (prefer English, then auto-generated)
    const track =
      captionTracks.find(
        (t: { languageCode?: string; vssId?: string }) =>
          t.languageCode === "en" || t.vssId?.includes(".en")
      ) ||
      captionTracks.find(
        (t: { languageCode?: string }) =>
          t.languageCode === "en-US" || t.languageCode === "en-GB"
      ) ||
      captionTracks.find(
        (t: { kind?: string; vssId?: string }) =>
          t.kind === "asr" || t.vssId?.startsWith("a.")
      ) ||
      captionTracks[0];

    if (!track?.baseUrl) {
      console.log("[v0] No valid baseUrl in track");
      return { text: "", error: "No valid caption URL found" };
    }

    console.log("[v0] Fetching captions from:", track.baseUrl.substring(0, 100));

    // Fetch the caption XML
    const captionResponse = await fetch(track.baseUrl);
    if (!captionResponse.ok) {
      return { text: "", error: `Failed to fetch captions: ${captionResponse.status}` };
    }

    const captionXml = await captionResponse.text();
    console.log("[v0] Caption XML length:", captionXml.length);

    // Parse XML to extract text
    const textMatches = captionXml.match(/<text[^>]*>([^<]*)<\/text>/g);
    if (!textMatches || textMatches.length === 0) {
      console.log("[v0] No text matches in XML");
      return { text: "", error: "No text found in captions" };
    }

    console.log("[v0] Found", textMatches.length, "caption segments");

    const fullText = textMatches
      .map((match) => {
        // Extract text content
        const textContent = match.replace(/<text[^>]*>/, "").replace(/<\/text>/, "");
        // Decode HTML entities
        return textContent
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&apos;/g, "'")
          .replace(/\n/g, " ");
      })
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    console.log("[v0] Transcript extracted, length:", fullText.length);
    return { text: fullText.slice(0, 10000) };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log("[v0] Direct scraping error:", msg);
    return { text: "", error: `Direct scraping failed: ${msg}` };
  }
}

/**
 * Method 3: Use youtube-transcript package as fallback
 */
async function fetchWithYoutubeTranscript(
  videoId: string
): Promise<{ text: string; error?: string }> {
  try {
    const { YoutubeTranscript } = await import("youtube-transcript");
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcriptItems || transcriptItems.length === 0) {
      return { text: "", error: "No transcript items found" };
    }

    const fullTranscript = transcriptItems.map((item) => item.text).join(" ");
    return { text: fullTranscript.slice(0, 10000) };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { text: "", error: `youtube-transcript failed: ${msg}` };
  }
}

/**
 * Fetches transcript using multiple methods with fallbacks
 */
async function fetchTranscript(
  videoId: string
): Promise<{ text: string; error?: string }> {
  console.log("[v0] Attempting to fetch transcript for video:", videoId);

  // Method 1: Try Supadata API first (requires API key)
  console.log("[v0] Trying Method 1: Supadata API");
  const supadataResult = await fetchWithSupadataAPI(videoId);
  if (supadataResult.text) {
    console.log("[v0] Method 1 (Supadata) succeeded");
    return supadataResult;
  }
  console.log("[v0] Method 1 failed:", supadataResult.error);

  // Method 1b: Try Kome.ai API (free, no auth)
  console.log("[v0] Trying Method 1b: Kome API");
  const komeResult = await fetchWithKomeAPI(videoId);
  if (komeResult.text) {
    console.log("[v0] Method 1b (Kome) succeeded");
    return komeResult;
  }
  console.log("[v0] Method 1b failed:", komeResult.error);

  // Method 2: Try youtube-captions-scraper
  console.log("[v0] Trying Method 2: youtube-captions-scraper");
  const scraperResult = await fetchWithCaptionsScraper(videoId);
  if (scraperResult.text) {
    console.log("[v0] Method 2 succeeded");
    return scraperResult;
  }
  console.log("[v0] Method 2 failed:", scraperResult.error);

  // Method 3: Try direct page scraping
  console.log("[v0] Trying Method 3: Direct scraping");
  const directResult = await fetchWithDirectScraping(videoId);
  if (directResult.text) {
    console.log("[v0] Method 3 succeeded");
    return directResult;
  }
  console.log("[v0] Method 3 failed:", directResult.error);

  // Method 4: Try youtube-transcript package
  console.log("[v0] Trying Method 4: youtube-transcript package");
  const ytResult = await fetchWithYoutubeTranscript(videoId);
  if (ytResult.text) {
    console.log("[v0] Method 4 succeeded");
    return ytResult;
  }
  console.log("[v0] Method 4 failed:", ytResult.error);

  // All methods failed
  return {
    text: "",
    error:
      "Could not fetch transcript. This video may not have captions enabled, or captions might be disabled by the creator. Please try a different video with the CC (closed captions) icon visible.",
  };
}

/**
 * Calls OpenAI API to convert transcript to article
 */
async function generateArticleWithAI(
  transcript: string
): Promise<{ markdown: string; error?: string }> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      markdown: "",
      error:
        "OPENAI_API_KEY is not configured. Please add it to your environment variables.",
    };
  }

  const systemPrompt = `You are an expert tech tutorial writer. Convert this YouTube video transcript into a structured Markdown blog post.

IMPORTANT: You MUST write the article in ENGLISH regardless of the transcript's language. If the transcript is in another language, translate it to English while preserving the meaning.

Guidelines:
- ALWAYS write in English
- Use H1 (#) for the main title
- Use H2 (##) for major sections
- Use H3 (###) for subsections if needed
- Bold **key terms** and important concepts
- Create a clear "Introduction" section
- Include relevant code blocks if the content discusses code
- Create a "Key Takeaways" or "Conclusion" section at the end
- Use bullet points and numbered lists where appropriate
- Keep the tone professional but engaging
- If the transcript mentions timestamps or filler words, ignore them
- Add a horizontal rule (---) before the conclusion

Important: Focus on extracting valuable, actionable information from the transcript. Always output in English.`;

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: `Convert this transcript into a well-structured blog article in ENGLISH. If the transcript is not in English, translate it while creating the article:\n\n${transcript}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 4096,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[v0] OpenAI API error:", errorData);
      return {
        markdown: "",
        error: `AI generation failed: ${errorData.error?.message || "Unknown error"}`,
      };
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content || "";

    if (!generatedText) {
      return {
        markdown: "",
        error: "AI returned empty response. Please try again.",
      };
    }

    // Add TubeScribe signature
    const finalMarkdown = `${generatedText}\n\n---\n\n*Generated with TubeScribe - Transforming videos into knowledge*`;

    return { markdown: finalMarkdown };
  } catch (error) {
    console.error("[v0] AI generation error:", error);
    return {
      markdown: "",
      error: "Failed to connect to AI service. Please try again.",
    };
  }
}

/**
 * Calculates word count and estimated reading time
 */
function calculateReadingStats(markdown: string): {
  wordCount: number;
  readingTime: number;
} {
  // Remove markdown syntax for accurate word count
  const plainText = markdown
    .replace(/#+\s/g, "") // Remove headers
    .replace(/\*\*/g, "") // Remove bold
    .replace(/\*/g, "") // Remove italic
    .replace(/`{3}[\s\S]*?`{3}/g, "") // Remove code blocks
    .replace(/`/g, "") // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Convert links to text
    .replace(/[-*_]{3,}/g, "") // Remove horizontal rules
    .replace(/\|[^|]+\|/g, "") // Remove table syntax
    .trim();

  const words = plainText.split(/\s+/).filter((word) => word.length > 0);
  const wordCount = words.length;

  // Average reading speed: 200-250 words per minute
  const readingTime = Math.max(1, Math.ceil(wordCount / 225));

  return { wordCount, readingTime };
}

export interface HashnodePublishResult {
  success: boolean;
  postUrl?: string;
  error?: string;
}

/**
 * Extracts title from markdown content (first H1 heading)
 */
function extractTitleFromMarkdown(markdown: string): string {
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    return titleMatch[1].trim();
  }
  // Fallback: use first line or generate a default title
  const firstLine = markdown.split('\n')[0]?.trim();
  return firstLine?.replace(/^#+\s*/, '') || 'Untitled Article';
}

/**
 * Publishes an article to Hashnode using their GraphQL API
 */
export async function publishToHashnodeAction(
  markdownContent: string,
  accessToken: string,
  publicationId: string
): Promise<HashnodePublishResult> {
  if (!accessToken || accessToken.trim() === "") {
    return {
      success: false,
      error: "Please provide your Hashnode Personal Access Token",
    };
  }

  if (!publicationId || publicationId.trim() === "") {
    return {
      success: false,
      error: "Please provide your Hashnode Publication ID",
    };
  }

  if (!markdownContent || markdownContent.trim() === "") {
    return {
      success: false,
      error: "No content to publish",
    };
  }

  const title = extractTitleFromMarkdown(markdownContent);
  
  // Remove the title from content since Hashnode adds it separately
  const contentWithoutTitle = markdownContent
    .replace(/^#\s+.+\n+/, '')
    .trim();

  const mutation = `
    mutation PublishPost($input: PublishPostInput!) {
      publishPost(input: $input) {
        post {
          id
          title
          slug
          url
        }
      }
    }
  `;

  const variables = {
    input: {
      title: title,
      contentMarkdown: contentWithoutTitle,
      publicationId: publicationId,
      tags: [],
    },
  };

  try {
    const response = await fetch("https://gql.hashnode.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": accessToken,
      },
      body: JSON.stringify({
        query: mutation,
        variables: variables,
      }),
    });

    const data = await response.json();

    // Check for authentication errors
    if (data.errors) {
      const errorMessage = data.errors[0]?.message || "Unknown error";
      
      if (
        errorMessage.toLowerCase().includes("unauthenticated") ||
        errorMessage.toLowerCase().includes("unauthorized") ||
        errorMessage.toLowerCase().includes("invalid token") ||
        errorMessage.toLowerCase().includes("authentication")
      ) {
        return {
          success: false,
          error: "Invalid Token. Please check your Hashnode Personal Access Token.",
        };
      }

      if (
        errorMessage.toLowerCase().includes("publication") ||
        errorMessage.toLowerCase().includes("not found")
      ) {
        return {
          success: false,
          error: "Publication not found. Please check your Publication ID.",
        };
      }

      return {
        success: false,
        error: `Hashnode API error: ${errorMessage}`,
      };
    }

    const post = data.data?.publishPost?.post;
    
    if (!post) {
      return {
        success: false,
        error: "Failed to publish. No post data returned.",
      };
    }

    return {
      success: true,
      postUrl: post.url,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Failed to connect to Hashnode: ${msg}`,
    };
  }
}

export async function generateArticleAction(
  url: string
): Promise<GenerationResult> {
  // Validate URL is provided
  if (!url || url.trim() === "") {
    return {
      success: false,
      markdown: "",
      error: "Please provide a YouTube URL",
    };
  }

  // Validate it's a YouTube URL
  if (!isValidYouTubeUrl(url)) {
    return {
      success: false,
      markdown: "",
      error:
        "Invalid URL. Please provide a valid YouTube link (e.g., youtube.com/watch?v=... or youtu.be/...)",
    };
  }

  // Extract video ID
  const videoId = extractVideoId(url);
  if (!videoId) {
    return {
      success: false,
      markdown: "",
      error:
        "Could not extract video ID from URL. Please check the link and try again.",
    };
  }

  // Fetch transcript
  const transcriptResult = await fetchTranscript(videoId);
  if (transcriptResult.error || !transcriptResult.text) {
    return {
      success: false,
      markdown: "",
      error: transcriptResult.error || "Failed to fetch transcript",
    };
  }

  // Generate article with AI
  const articleResult = await generateArticleWithAI(transcriptResult.text);
  if (articleResult.error || !articleResult.markdown) {
    return {
      success: false,
      markdown: "",
      error: articleResult.error || "Failed to generate article",
    };
  }

  // Calculate reading stats
  const stats = calculateReadingStats(articleResult.markdown);

  return {
    success: true,
    markdown: articleResult.markdown,
    wordCount: stats.wordCount,
    readingTime: stats.readingTime,
  };
}
