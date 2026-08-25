"use client";

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { motion } from "motion/react";

import { itemVariants } from "@/lib/utils/animations";

import { MinusIcon } from "../../icons/Minus";
import { PlusIcon } from "../../icons/Plus";

interface Entry {
  title: string;
  description: React.ReactNode;
}

interface AccordionProps {
  entries: Entry[];
}

export const Accordion: React.FC<AccordionProps> = ({ entries }) => {
  return (
    <div className="mx-auto w-full">
      <dl className="mt-16">
        {entries.map((entry, i) => (
          <Disclosure
            key={entry.title}
            as={motion.div}
            variants={itemVariants}
            className="border-t border-gray-900 first:pt-0 last:border-b last:pb-0"
          >
            {({ open }) => (
              <>
                <motion.dt variants={itemVariants}>
                  <DisclosureButton className="group flex w-full cursor-pointer items-start justify-between py-6 pl-1 text-left text-gray-900">
                    <span className="flex items-baseline gap-8 transition-all delay-300 duration-75">
                      <span className="text-ink text-4xl leading-[23px] font-bold">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-ink text-xl leading-[23px] font-normal">
                        {entry.title}
                      </span>
                    </span>
                    <span className="mr-4 flex h-7 items-center justify-center">
                      <PlusIcon
                        aria-hidden="true"
                        className="size-4 group-data-open:hidden"
                      />
                      <MinusIcon
                        aria-hidden="true"
                        className="h-2 w-4 group-not-data-open:hidden"
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
                  className="overflow-hidden border-t border-gray-900 md:pr-12"
                >
                  <div className="lg:w-4/5">
                    <div className="pt-12 pb-12 text-base/7 leading-6 text-black/50 md:pl-7">
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
