import { motion } from "framer-motion";

export function SectionHeading({
  eyebrow,
  title,
  description
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
}>): React.JSX.Element {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <motion.p
        className="section-label mb-4"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        className="headline text-3xl font-medium tracking-tight sm:text-5xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6 }}
      >
        {title}
      </motion.h2>
      <motion.p
        className="mx-auto mt-5 max-w-2xl text-base leading-7 text-secondary sm:text-lg"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, delay: 0.08 }}
      >
        {description}
      </motion.p>
    </div>
  );
}
