"use client";

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { motion } from "motion/react";

import { itemVariants } from "@/lib/animations";
import { classNames } from "@/lib/classNames";

import { MinusIcon } from "../../icons/Minus";
import { PlusIcon } from "../../icons/Plus";

interface Entry {
  title: string;
  description: string | React.ReactNode;
}

interface AccordionProps {
  entries: Entry[];
  fixedSize?: boolean;
  showNumbers?: boolean;
  fullSizeText?: boolean;
  onHoverStart?: (index: number) => void;
  onHoverEnd?: (index: number) => void;
}

export const Accordion: React.FC<AccordionProps> = ({
  entries,
  fixedSize = true,
  showNumbers = true,
  fullSizeText = false,
  onHoverStart,
  onHoverEnd,
}) => {
  return (
    <div
      className={classNames("mx-auto", {
        "lg:w-6xl 2xl:w-7xl px-6": fixedSize,
        "w-full": !fixedSize,
      })}
    >
      <dl className="mt-16">
        {entries.map((entry, i) => (
          <Disclosure
            key={entry.title}
            as={motion.div}
            variants={itemVariants}
            className="border-t last:border-b border-gray-900 first:pt-0 last:pb-0"
            onHoverStart={() => onHoverStart?.(i)}
            onHoverEnd={() => onHoverEnd?.(i)}
          >
            {({ open }) => (
              <>
                <motion.dt variants={itemVariants}>
                  <DisclosureButton className="group flex w-full items-start justify-between text-left text-gray-900 cursor-pointer pl-1 py-6">
                    <span
                      className={classNames(
                        "transition-all delay-300 duration-75 md:text-lg"
                      )}
                    >
                      {showNumbers ? `${i + 1}.` : ""} {entry.title}
                    </span>
                    <span className="flex h-7 justify-center items-center mr-4">
                      <PlusIcon
                        aria-hidden="true"
                        className="size-4 group-data-open:hidden"
                      />
                      <MinusIcon
                        aria-hidden="true"
                        className="w-4 h-2 group-not-data-open:hidden"
                      />
                    </span>
                  </DisclosureButton>
                </motion.dt>
                <DisclosurePanel
                  static
                  as={motion.dd}
                  initial={false}
                  animate={open ? "open" : "collapsed"}
                  variants={{
                    open: { height: "auto", opacity: 1 },
                    collapsed: { height: 0, opacity: 0 },
                  }}
                  className={classNames(
                    "overflow-hidden md:pr-12 border-t border-gray-900",
                    {
                      "md:pr-0": fullSizeText,
                    }
                  )}
                >
                  <div
                    className={classNames("py-0", {
                      "lg:w-4/5": !fullSizeText,
                      "w-full": fullSizeText,
                    })}
                  >
                    <div
                      className={classNames(
                        "pb-12 pt-12 text-base/7 text-black/50 leading-6",
                        {
                          "md:pl-7 ": !fullSizeText,
                          "pl-0": fullSizeText,
                        }
                      )}
                    >
                      {entry.description}
                    </div>
                  </div>
                </DisclosurePanel>
              </>
            )}
          </Disclosure>
        ))}
      </dl>
    </div>
  );
};
