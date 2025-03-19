import { sanitizeInput } from "@lib/string";

describe("sanitizeInput", () => {
  it("should sanitize basic HTML tags", () => {
    const input = "<p>Hello World</p>";
    expect(sanitizeInput(input)).toBe("&lt;p&gt;Hello World&lt;&#x2F;p&gt;");
  });

  it("should handle script tags", () => {
    const input = "Hello <script>alert('xss')</script> World";
    expect(sanitizeInput(input)).toBe(
      "Hello &lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt; World",
    );
  });

  it("should handle special characters", () => {
    const input = "Hello & World < > \" '";
    expect(sanitizeInput(input)).toBe(
      "Hello &amp; World &lt; &gt; &quot; &#x27;",
    );
  });

  it("should handle empty strings", () => {
    expect(sanitizeInput("")).toBe("");
  });

  it("should handle malicious CSS injection", () => {
    const input = '<div style="background:url(javascript:alert(1))">test</div>';
    expect(sanitizeInput(input)).toBe(
      "&lt;div style=&quot;background:url(javascript:alert(1))&quot;&gt;test&lt;&#x2F;div&gt;",
    );
  });

  it("should handle nested malicious content", () => {
    const input =
      '<div><img src="x" onerror="alert(1)"><script>evil()</script></div>';
    expect(sanitizeInput(input)).toBe(
      "&lt;div&gt;&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;&lt;script&gt;evil()&lt;&#x2F;script&gt;&lt;&#x2F;div&gt;",
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

  it("should sanitize and escape allowed HTML tags", () => {
    // DOMPurify will allow basic tags like <b>, but the escape will convert them.
    const input = "Test <b>bold</b> text";
    const output = sanitizeInput(input);
    expect(output).toBe("Test &lt;b&gt;bold&lt;&#x2F;b&gt; text");
  });

  it("should preserve but escape script tags", () => {
    const input = "Hello <script>alert('x');</script> world";
    const output = sanitizeInput(input);

    // Script tags should be escaped, not removed
    expect(output).toContain("&lt;script&gt;");
    expect(output).toContain("alert");
    expect(output).toBe(
      "Hello &lt;script&gt;alert(&#x27;x&#x27;);&lt;&#x2F;script&gt; world",
    );
  });

  it("should correctly escape special characters", () => {
    const input = "5 > 3 & 2 < 4";
    const output = sanitizeInput(input);
    expect(output).toBe("5 &gt; 3 &amp; 2 &lt; 4");
  });

  it("should escape quotes and other special characters", () => {
    const input = `O'Reilly & "Google" <inc>`;
    const output = sanitizeInput(input);
    expect(output).toBe("O&#x27;Reilly &amp; &quot;Google&quot; &lt;inc&gt;");
  });

  it("should return an empty string when given an empty string", () => {
    const input = "";
    const output = sanitizeInput(input);
    expect(output).toBe("");
  });
});
