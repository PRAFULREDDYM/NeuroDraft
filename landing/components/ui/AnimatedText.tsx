"use client";

import React from "react";
import { motion } from "framer-motion";

interface AnimatedTextProps {
  text: string;
  className?: string;
  el?: React.ElementType;
  once?: boolean;
}

const defaultAnimations = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function AnimatedText({
  text,
  className,
  el = "p",
  once = true,
}: AnimatedTextProps) {
  const words = text.split(" ");
  const Wrapper: any = el;

  return (
    <Wrapper className={className}>
      <motion.span
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: "-50px" }}
        transition={{ staggerChildren: 0.08 }}
        aria-hidden="true"
      >
        {words.map((word, index) => (
          <span className="inline-block" key={`${word}-${index}`}>
            <motion.span className="inline-block" variants={defaultAnimations}>
              {word}
            </motion.span>
            <span className="inline-block">&nbsp;</span>
          </span>
        ))}
      </motion.span>
    </Wrapper>
  );
}
