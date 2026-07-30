/**
 * Shared dark marketing background.
 *
 * The restrained, static radial light matches the accepted landing treatment
 * and avoids decorative motion behind page content.
 */
export const AnimatedGradientBackground = () => {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-20 bg-neutral-950 bg-marketing-radial"
      aria-hidden="true"
    />
  );
};
