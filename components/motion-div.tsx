"use client";
import React from 'react'
import { motion } from "framer-motion";

type Props = {
  children?: React.ReactNode
  className?: string
}

export const MotionDiv = ({ children, className = '' }: Props) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
};
