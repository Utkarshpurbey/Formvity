"use client";

import { workspaceAvatarStyle, workspaceInitials } from "../../lib/workspaceUtils";

type WorkspaceAvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClass = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
};

export function WorkspaceAvatar({ name, size = "md", className = "" }: WorkspaceAvatarProps) {
  const style = workspaceAvatarStyle(name);
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl font-bold ${sizeClass[size]} ${className}`}
      style={{ backgroundColor: style.background, color: style.color }}
      aria-hidden
    >
      {workspaceInitials(name)}
    </span>
  );
}
