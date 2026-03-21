import mongoose from 'mongoose';

/**
 * Applies cursor-based pagination to a Mongoose query.
 * Uses _id as cursor (naturally ordered by insertion time).
 *
 * @param {mongoose.Query} query - The base query (filters already applied)
 * @param {string|null} cursor  - The _id of the last item from the previous page
 * @param {number} limit        - Page size (default 20, max 100)
 * @returns {{ query: mongoose.Query, limit: number }}
 */
export const applyCursor = (query, cursor, limit = 20) => {
  limit = Math.min(Math.max(1, limit), 100);

  if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
    query = query.where('_id').lt(cursor);
  }

  return { query: query.sort({ _id: -1 }).limit(limit + 1), limit };
};

/**
 * Formats the result set with cursor metadata.
 *
 * @param {Array} docs  - Documents returned by the query (limit + 1 fetched)
 * @param {number} limit
 * @returns {{ data: Array, nextCursor: string|null, hasMore: boolean }}
 */
export const formatCursorResult = (docs, limit) => {
  const hasMore = docs.length > limit;
  if (hasMore) docs.pop();

  return {
    data: docs,
    nextCursor: hasMore ? docs[docs.length - 1]._id.toString() : null,
    hasMore,
  };
};
