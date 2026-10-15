import { useState } from "react";
import { getInitials } from "../../utils/format";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: number;
}

/** Profile picture with an initials fallback (also used if the image fails to load). */
export function Avatar({ name, src, size = 36 }: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  const style = { width: size, height: size, fontSize: size * 0.4 };

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt=""
        className="avatar"
        style={style}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
      />
    );
  }
  return (
    <span className="avatar avatar--fallback" style={style} aria-hidden>
      {getInitials(name)}
    </span>
  );
}
