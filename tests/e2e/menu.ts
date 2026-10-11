// Run with the CUA browser tool against the built local site at 390/320px.
// The structural interface matches the documented CUA Playwright surface.
interface Locator {
  count(): Promise<number>;
  click(): Promise<void>;
  press(key: string): Promise<void>;
  isVisible(): Promise<boolean>;
  getAttribute(name: string): Promise<string | null>;
  getByRole(role: string, options: { name: string; exact?: boolean }): Locator;
}
interface MenuTestTab {
  playwright: {
    getByRole(role: string, options: { name: string; exact?: boolean }): Locator;
    evaluate<T>(callback: () => T): Promise<T>;
  };
}

export async function verifyMobileMenu(tab: MenuTestTab) {
  const assert = (condition: boolean, message: string) => { if (!condition) throw new Error(message); };
  const trigger = tab.playwright.getByRole('button', { name: 'Открыть меню', exact: true });
  assert(await trigger.count() === 1, 'menu: named trigger is missing');
  const originalOverflow = await tab.playwright.evaluate(() => document.body.style.overflow);
  await trigger.click();
  const dialog = tab.playwright.getByRole('dialog', { name: 'Навигация по сайту', exact: true });
  assert(await dialog.isVisible(), 'menu: dialog did not open');
  assert(await trigger.getAttribute('aria-expanded') === 'true', 'menu: expanded state is incorrect');
  assert(await tab.playwright.evaluate(() => document.body.style.overflow === 'hidden'), 'menu: background scroll is unlocked');
  const close = dialog.getByRole('button', { name: 'Закрыть меню', exact: true });
  await close.press('Shift+Tab');
  assert(await tab.playwright.evaluate(() => document.activeElement?.getAttribute('data-menu-last') === 'true'), 'menu: focus escaped the dialog');
  await dialog.press('Escape');
  assert(!await dialog.isVisible(), 'menu: Escape did not close the dialog');
  assert(await trigger.getAttribute('aria-expanded') === 'false', 'menu: collapsed state is incorrect');
  assert(await tab.playwright.evaluate(() => document.activeElement?.id === 'mobile-menu-trigger'), 'menu: focus did not return');
  assert(await tab.playwright.evaluate(() => document.body.style.overflow) === originalOverflow, 'menu: scroll was not restored');
  await trigger.click();
  await dialog.getByRole('link', { name: 'Главная', exact: true }).click();
  assert(!await dialog.isVisible(), 'menu: navigation did not close the dialog');
  assert(await tab.playwright.evaluate(() => document.body.style.overflow) === originalOverflow, 'menu: navigation did not restore scroll');
  return 'menu: open / focus containment / Escape / focus return / navigation / scroll — PASS';
}
