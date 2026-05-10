import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                    eBarangayHub
                </span>
                <span className="truncate text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/60">
                    SABIMS Module
                </span>
            </div>
        </>
    );
}
