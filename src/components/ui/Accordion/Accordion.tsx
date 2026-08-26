"use client";

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";

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
            as="div"
            className="border-ink border-t first:pt-0 last:border-b last:pb-0"
          >
            {({ open }) => (
              <>
                <dt>
                  <DisclosureButton className="group text-ink flex w-full cursor-pointer items-start justify-between py-6 pl-1 text-left">
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
                </dt>
                {/* `static` keeps this content in the DOM (and visible to
                    crawlers/AT that ignore CSS) even while visually collapsed. */}
                <DisclosurePanel
                  static
                  as="dd"
                  style={{
                    gridTemplateRows: open ? "1fr" : "0fr",
                    opacity: open ? 1 : 0,
                  }}
                  className="border-ink grid border-t transition-[grid-template-rows,opacity] duration-300 ease-in-out motion-reduce:transition-none md:pr-12"
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="lg:w-4/5">
                      <div className="pt-12 pb-12 text-base/7 leading-6 text-neutral-600 md:pl-7">
                        {entry.description}
                      </div>
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
