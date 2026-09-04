import { GetServerSideProps } from "next";

/**
 * Used to render the literal string "Profile" — a 5-line stub, while still
 * listed as a protected route in middleware.ts. The real profile/account
 * editing page is account-settings; redirect here (server-side, so there's
 * no client-rendered flash of the stub) rather than leaving a dead end.
 */
export const getServerSideProps: GetServerSideProps = async () => {
  // Next's i18n routing (next.config.js) locale-prefixes a relative
  // `redirect.destination` on its own — matching the pattern already used by
  // [subcategory]/index.tsx's single-product redirect — so this is not
  // prefixed by hand here.
  return {
    redirect: {
      destination: "/account-dashboard/account-settings",
      permanent: false,
    },
  };
};

export default function Profile() {
  return null;
}
