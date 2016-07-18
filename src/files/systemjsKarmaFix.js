/**
 * SystemJS does not have the module
 * method defined, whith TypeScript
 * uses.
 */
if (!module) {
  function module() {}
}
