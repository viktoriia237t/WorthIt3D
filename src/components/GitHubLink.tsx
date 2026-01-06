import React from 'react';
import { Button } from "@heroui/button";
import { Github } from "lucide-react";

<Github />
export const GitHubLink: React.FC = () => {
  return (
    <Button
      as="a"
      href="https://github.com/viktoriia237t/WorthIt3D"
      target="_blank"
      rel="noopener noreferrer"
      variant="flat"
      size="sm"
      isIconOnly
      aria-label="GitHub Repository"
    >
      <Github size={16} />
    </Button>
  );
};
