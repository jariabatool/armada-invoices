import markUrl from "../../assets/brand/armada-mark.png";

interface LogoProps {
  /** "color" for light backgrounds, "white" for dark ones */
  variant?: "color" | "white";
  /** Show the "Invoices" product label after the wordmark */
  showProduct?: boolean;
}

export function Logo({ variant = "color", showProduct = true }: LogoProps) {
  return (
    <span className={`logo logo--${variant}`}>
      <img src={markUrl} alt="" className="logo__mark" />
      <span className="logo__wordmark" role="img" aria-label="Armada" />
      {showProduct && <span className="logo__product">Invoices</span>}
    </span>
  );
}
