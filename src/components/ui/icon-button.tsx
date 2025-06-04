import clsx from "clsx";
import ButtonLink, { ButtonLinkProps } from "./button-link";
import Image from "next/image";

type Props = {
  icon: string | React.ReactNode;
  iconContainerClassName?: string;
  childrenClassName?: string;
} & ButtonLinkProps;

export function IconButton({
  children,
  icon,
  className,
  iconContainerClassName,
  childrenClassName,
  ...props
}: Props) {
  return (
    <ButtonLink
      {...props}
      className={clsx(className, "flex items-center gap-2")}
    >
      {typeof icon === "string" ? (
        <Image className={clsx(iconContainerClassName)} src={icon} alt="Icon" width={24} height={24} />
      ) : (
        <div className={clsx("w-6 h-6 flex items-center justify-center", iconContainerClassName)}>
          {icon}
        </div>
      )}
      <p className={clsx("font-semibold text-[16px]", childrenClassName)}>
        {children}
      </p>
    </ButtonLink>
  );
}
