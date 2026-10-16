import { setupRippleDirective } from "./business/ripple";
import { setupPermissionDirective } from "./business/permission";

export function setupDirectives(app) {
  setupRippleDirective(app);
  setupPermissionDirective(app);
}
