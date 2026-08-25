"use client";

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";

import { MinusIcon } from "../icons/Minus";
import { PlusIcon } from "../icons/Plus";

interface DetailAccordionProps {
  title: string;
  children: React.ReactNode;
}

export const DetailAccordion: React.FC<DetailAccordionProps> = ({
  title,
  children,
}) => {
  return (
    <Disclosure as="div" className="border-t border-neutral-200 last:border-b">
      <DisclosureButton className="group flex w-full cursor-pointer items-center justify-between py-4 text-left">
        <span className="text-ink text-sm font-medium">{title}</span>
        <span className="flex h-4 w-4 items-center justify-center">
          <PlusIcon className="size-3 group-data-open:hidden" />
          <MinusIcon className="h-0.5 w-3 group-not-data-open:hidden" />
        </span>
      </DisclosureButton>
      <DisclosurePanel className="pb-4 text-sm leading-relaxed text-neutral-600">
        {children}
      </DisclosurePanel>
    </Disclosure>
  );
};
