import React, { useContext } from 'react';
import { LayoutContext } from './context/layoutcontext';
import MobileFooterMenu from './MobileFooterMenu';
import { classNames } from 'primereact/utils';
import { usePathname } from 'next/navigation';
import useMobileDetect from '@/demo/hooks/useMobileDetect';

const AppFooter = () => {
    const isMobile = useMobileDetect();
    const { layoutConfig } = useContext(LayoutContext);
    const pathname = usePathname();

    const hideFooterRoutes = ['/login'];
    const shouldHideFooter = pathname ? hideFooterRoutes.includes(pathname) : false;

    if (shouldHideFooter) {
        return null;
    }

    return (
        <>
            {isMobile ? (
                <div className={classNames('mobile-footer-container', {
                    'hidden': shouldHideFooter
                })}>
                    <MobileFooterMenu />
                </div>
            ) : (
                <div className={classNames('layout-footer', {
                    'hidden': shouldHideFooter
                })}>
                    &copy; 2025 All Rights Reserved by
                    <span className="font-medium ml-2">reTailored</span>
                </div>
            )}
        </>
    );
};

export default AppFooter;