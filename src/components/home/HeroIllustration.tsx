export function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 320 220"
      className="h-auto w-full max-w-sm"
      aria-hidden="true"
    >
      <path
        d="M20 190c40-70 100-70 140 0M160 190c40-70 100-70 140 0"
        stroke="#E1F5EE"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="160" cy="70" r="26" fill="#E1F5EE" />
      <path
        d="M160 96c-24 0-40 16-40 38h80c0-22-16-38-40-38Z"
        fill="#1D9E75"
      />
      <circle cx="160" cy="66" r="18" fill="#1D9E75" />
      <path
        d="M60 150c10-30 30-46 55-52M260 150c-10-30-30-46-55-52"
        stroke="#0F6E56"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="2 10"
      />
      <circle cx="55" cy="156" r="6" fill="#0F6E56" />
      <circle cx="265" cy="156" r="6" fill="#1D9E75" />
    </svg>
  );
}
