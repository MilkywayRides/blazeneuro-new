"use client";

import dynamic from "next/dynamic";

const MarkdownPreview = dynamic(() => import("@uiw/react-markdown-preview"), { ssr: false });

export function BlogContent({ content }: { content: string }) {
  return (
    <>
      <div data-color-mode="light" className="dark:hidden">
        <MarkdownPreview source={content} style={{ backgroundColor: 'transparent' }} />
      </div>
      <div data-color-mode="dark" className="hidden dark:block">
        <MarkdownPreview source={content} style={{ backgroundColor: 'transparent' }} />
      </div>
    </>
  );
}
