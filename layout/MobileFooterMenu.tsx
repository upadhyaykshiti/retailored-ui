import React, { useContext, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { classNames } from 'primereact/utils';
import { LayoutContext } from './context/layoutcontext';

interface MenuItem {
    label: string;
    icon: string;
    path?: string;
    onClick?: () => void;
}

const MobileFooterMenu = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { onMenuToggle } = useContext(LayoutContext);
    const [activeButton, setActiveButton] = useState<string | null>(null);
    
    const menuItems: MenuItem[] = [
        { label: 'Home', icon: 'pi pi-home', path: '/pages/dashboard' },
        { label: 'Sales', icon: 'pi pi-money-bill', path: '/pages/orders/sales-order' },
        { label: 'Jobs', icon: 'pi pi-briefcase', path: '/pages/orders/job-order' },
        { label: 'Payments', icon: 'pi pi-dollar', path: '/pages/reports/pending-payments' },
        { label: 'Menu', icon: 'pi pi-bars', onClick: onMenuToggle }
    ];

    const handleNavigation = (path?: string, label?: string) => {
        if (path) router.push(path);
        if (label) {
            setActiveButton(label);
            setTimeout(() => setActiveButton(null), 200);
        }
    };

    return (
        <div className="mobile-footer-menu">
            {menuItems.map((item) => (
                <button 
                    key={item.label}
                    className={classNames('footer-menu-item', {
                        'active': pathname === item.path,
                        'click-effect': activeButton === item.label
                    })}
                    onClick={() => {
                        if (item.onClick) item.onClick();
                        else handleNavigation(item.path, item.label);
                    }}
                    aria-label={item.label}
                >
                    <div className="icon-container">
                        <i className={item.icon} />
                        {activeButton === item.label && <span className="ripple-effect"></span>}
                    </div>
                    <span className="menu-label">{item.label}</span>
                </button>
            ))}
        </div>
    );
};

export default MobileFooterMenu;