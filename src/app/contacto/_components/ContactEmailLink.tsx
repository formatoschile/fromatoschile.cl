"use client";

import { ANALYTICS_EVENTS, LOCATIONS, trackEvent } from "@/lib/analytics";

interface ContactEmailLinkProps {
  email: string;
  className?: string;
}

/** The contact page's `mailto:` link, reporting `fc_contact_click`. */
export const ContactEmailLink: React.FC<ContactEmailLinkProps> = ({
  email,
  className,
}) => {
  return (
    <a href={`mailto:${email}`} onClick={handleClick} className={className}>
      {email}
    </a>
  );
};

function handleClick(): void {
  trackEvent({
    event: ANALYTICS_EVENTS.contactClick,
    labels: { location: LOCATIONS.contactPage },
  });
}
