"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image, { StaticImageData } from "next/image";
import { useRef } from "react";

interface ParallaxImageProps {
  src: string | StaticImageData;
  alt: string;
  className?: string;
  containerClassName?: string;
}

export function ParallaxImage({ src, alt, className, containerClassName }: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Moves the image slightly opposite to scroll direction
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${containerClassName}`}>
      <motion.div style={{ y }} className="w-full h-[124%] absolute -top-[12%] left-0 will-change-transform">
        <Image src={src} alt={alt} fill className={`object-cover ${className}`} />
      </motion.div>
    </div>
  );
}
