import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getThreads } from "../services/threads.service";
import useDebounce from "../hooks/useDebounce";
import SearchBar from "./SearchBar.jsx";
import SortDropdown from "./SortDropdown.jsx";
import ThreadItem from "./ThreadItem.jsx";

export default function ThreadList() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["threads", { search: debouncedSearch, sort, page }],
    queryFn: () => getThreads({ search: debouncedSearch, sort, page }),
    placeholderData: keepPreviousData,
  });

  const threads = data?.threads ?? [];

  return (
    <div>
      <div className="controls">
        <SearchBar
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />

        <SortDropdown
          value={sort}
          onChange={(value) => {
            setSort(value);
            setPage(1);
          }}
        />
      </div>

      {isPending && <p className="muted">Loading threads…</p>}

      {isError && (
        <p className="error">
          Could not load threads: {error.message}
        </p>
      )}

      {!isPending && !isError && threads.length === 0 && (
        <p className="muted">
          No threads match “{debouncedSearch}”.
        </p>
      )}

      <ul className="threads">
        {threads.map((thread) => (
          <ThreadItem key={thread.id} thread={thread} />
        ))}
      </ul>

      {!isError && (
        <div className="pagination">
          <button
            onClick={() => setPage((current) => current - 1)}
            disabled={page === 1}
          >
            Previous
          </button>

          <span>
            Page {page} of{" "}
            {Math.max(1, Math.ceil((data?.total ?? 0) / 10))}
          </span>

          <button
            onClick={() => setPage((current) => current + 1)}
            disabled={!data?.hasMore}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}