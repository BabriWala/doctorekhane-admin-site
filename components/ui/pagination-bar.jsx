"use client";
import { Button } from "./button";
export function PaginationBar({ pagination, page, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  return <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-sm"><span>{pagination.totalItems} results · Page {pagination.currentPage} of {pagination.totalPages}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => onPageChange(page + 1)}>Next</Button></div></div>;
}
