import { sanitizeInput } from "@lib/string";

describe("sanitizeInput", () => {
  it("should sanitize basic HTML tags", () => {
    const input = "<p>Hello World</p>";
    expect(sanitizeInput(input)).toBe("&lt;p&gt;Hello World&lt;&#x2F;p&gt;");
  });

  it("should handle script tags by removing them", () => {
    const input = "Hello <script>alert('xss')</script> World";
    // DOMPurify removes script tags by default, then validator escapes remaining content
    expect(sanitizeInput(input)).toBe("Hello  World");
  });

  it("should handle special characters", () => {
    const input = "Hello & World < > \" '";
    expect(sanitizeInput(input)).toBe(
      "Hello &amp;amp; World &amp;lt; &amp;gt; &quot; &#x27;",
    );
  });

  it("should handle empty strings", () => {
    expect(sanitizeInput("")).toBe("");
  });

  it("should handle malicious CSS injection", () => {
    const input = '<div style="background:url(javascript:alert(1))">test</div>';
    // Note: DOMPurify with current configuration might not remove javascript: URLs
    expect(sanitizeInput(input)).toBe(
      "&lt;div style=&quot;background:url(javascript:alert(1))&quot;&gt;test&lt;&#x2F;div&gt;",
    );
  });

  it("should handle nested malicious content", () => {
    const input =
      '<div><img src="x" onerror="alert(1)"><script>evil()</script></div>';
    // DOMPurify removes onerror attributes and script tags
    expect(sanitizeInput(input)).toBe(
      "&lt;div&gt;&lt;img src=&quot;x&quot;&gt;&lt;&#x2F;div&gt;",
    );
  });

  it("should handle unicode characters", () => {
    const input = "Hello 👋 World";
    expect(sanitizeInput(input)).toBe("Hello 👋 World");
  });

  it("should handle line breaks", () => {
    const input = "Hello\nWorld";
    expect(sanitizeInput(input)).toBe("Hello\nWorld");
  });

  it("should handle complex HTML structure", () => {
    const input = `
      <div class="test">
        <h1>Title</h1>
        <p>Content with <strong>bold</strong> text</p>
      </div>
    `;
    expect(sanitizeInput(input)).toBe(
      "\n      &lt;div class=&quot;test&quot;&gt;\n        &lt;h1&gt;Title&lt;&#x2F;h1&gt;\n        &lt;p&gt;Content with &lt;strong&gt;bold&lt;&#x2F;strong&gt; text&lt;&#x2F;p&gt;\n      &lt;&#x2F;div&gt;\n    ",
    );
  });

  it("should handle data attributes", () => {
    const input = '<div data-testid="test">content</div>';
    expect(sanitizeInput(input)).toBe(
      "&lt;div data-testid=&quot;test&quot;&gt;content&lt;&#x2F;div&gt;",
    );
  });

  it("should return the same plain text when no HTML is present", () => {
    const input = "Hello World";
    const output = sanitizeInput(input);
    expect(output).toBe("Hello World");
  });

  it("should preserve allowed HTML tags during sanitization but escape them after", () => {
    const input = "Test <b>bold</b> text";
    const output = sanitizeInput(input);
    expect(output).toBe("Test &lt;b&gt;bold&lt;&#x2F;b&gt; text");
  });

  it("should completely remove dangerous tags like <script>", () => {
    const input = "Hello <script>alert('x');</script> world";
    const output = sanitizeInput(input);

    // Script tags should be completely removed by DOMPurify
    expect(output).not.toContain("script");
    expect(output).not.toContain("alert");
    expect(output).toBe("Hello  world");
  });

  it("should correctly handle potentially dangerous attribute values", () => {
    const input = '<a href="javascript:void(0)" onclick="evil()">Click me</a>';
    const output = sanitizeInput(input);

    // DOMPurify should strip javascript: URLs and onclick attributes
    expect(output).not.toContain("onclick");
    expect(output).toBe("&lt;a&gt;Click me&lt;&#x2F;a&gt;");
  });

  it("should handle iframe elements by removing them", () => {
    const input = '<iframe src="https://evil.com"></iframe>Hello';
    const output = sanitizeInput(input);

    // DOMPurify should remove iframes by default
    expect(output).not.toContain("iframe");
    expect(output).toBe("Hello");
  });

  it("should handle encoded HTML entities correctly", () => {
    const input = "Already &lt;escaped&gt; content";
    const output = sanitizeInput(input);

    // DOMPurify preserves entities, validator escape will double-escape them
    expect(output).toBe("Already &amp;lt;escaped&amp;gt; content");
  });

  it("should protect against recursive injection attacks", () => {
    const input = '<img src="x" onerror="<script>alert(1)</script>">';
    const output = sanitizeInput(input);

    // Should remove both the onerror attribute and the nested script
    expect(output).toBe("&lt;img src=&quot;x&quot;&gt;");
  });
});
