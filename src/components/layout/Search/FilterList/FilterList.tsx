import React, { Suspense } from "react";

import { FilterItem } from "./FilterItem";
import { FilterItemDropdown } from "./FilterItemDropdown";
import { ListItem } from "./FilterList.types";

interface FilterItemListProps {
  list: ListItem[];
}

const FilterItemList: React.FC<FilterItemListProps> = ({ list }) => {
  return (
    <>
      {list.map((item: ListItem, i) => (
        <FilterItem key={i} item={item} />
      ))}
    </>
  );
};

interface FilterListProps {
  list: ListItem[];
  title?: string;
}

export const FilterList: React.FC<FilterListProps> = ({ list, title }) => {
  return (
    <>
      <nav>
        {title ? (
          <h3 className="hidden text-xs text-neutral-500 md:block dark:text-neutral-400">
            {title}
          </h3>
        ) : null}
        <ul className="hidden md:block">
          <Suspense fallback={null}>
            <FilterItemList list={list} />
          </Suspense>
        </ul>
        <ul className="md:hidden">
          <Suspense fallback={null}>
            <FilterItemDropdown list={list} />
          </Suspense>
        </ul>
      </nav>
    </>
  );
};
