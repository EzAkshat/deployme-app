export type PlatformRole = "USER" | "SITE_ADMIN" | "SUPER_ADMIN";

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  onboardingCompletedAt: string | null;
  /**
   * Older authentication responses may omit the role. Only explicit
   * administrator roles should show admin navigation.
   */
  platformRole?: PlatformRole;
}