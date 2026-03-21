/**
 * Mongoose plugin that auto-injects { orgId } filter into queries
 * when the query options include an orgId context.
 *
 * Usage in middleware: set query option { orgId } before executing.
 * The orgScope middleware sets this via req.orgContext, and services
 * pass it through as a query option.
 */
export const orgScopePlugin = (schema) => {
  const scopedOps = ['find', 'findOne', 'countDocuments', 'updateMany', 'deleteMany'];

  for (const op of scopedOps) {
    schema.pre(op, function (next) {
      const orgId = this.getOptions().orgId;
      if (orgId) {
        this.where({ orgId });
      }
      next();
    });
  }
};
