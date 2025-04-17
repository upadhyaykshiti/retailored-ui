/* eslint-disable @next/next/no-img-element */
import React from 'react';
import AppMenuitem from './AppMenuitem';
import { MenuProvider } from './context/menucontext';
import { AppMenuItem } from '@/types';

const AppMenu = () => {

    const model: AppMenuItem[] = [
        {
            label: 'Home',
            items: [
                { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }
            ]
        },
        {
            label: 'Transactions',
            items: [
                { label: 'Sales Order', icon: 'pi pi-fw pi-money-bill', to: '/pages/orders/sales-order' },
                { label: 'Job Order', icon: 'pi pi-fw pi-briefcase', to: '/pages/orders/job-order' }
            ]
        },
        {
            label: 'Masters',
            items: [
                { label: 'Products', icon: 'pi pi-fw pi-box', to: '/pages/garments' },
                { label: 'Customers', icon: 'pi pi-fw pi-users', to: '/pages/customer/customer-list' },
                { label: 'Jobbers', icon: 'pi pi-fw pi-wrench', to: '/pages/jobbers' },
                { label: 'Vendors', icon: 'pi pi-fw pi-truck', to: '/pages/vendors' },
                { label: 'Measurement Options', icon: 'pi pi-fw pi-sliders-h', to: '/pages/measurement-options' },
            ]
        },
        {
            label: 'Reports',
            items: [
                { label: 'Pending Sales Orders', icon: 'pi pi-fw pi-clock', to: '/pages/reports/pending-sales', disabled: true },
                { label: 'Pending Job Orders', icon: 'pi pi-fw pi-clock', to: '/pages/reports/pending-jobs', disabled: true },
                { label: 'Pending Payments', icon: 'pi pi-fw pi-dollar', to: '/pages/reports/pending-payments' }
            ]
        },
        {
            label: 'Settings',
            items: [
                { label: 'Users', icon: 'pi pi-fw pi-user', to: '/pages/settings/users', disabled: true },
                { label: 'Configuration', icon: 'pi pi-fw pi-cog', to: '/pages/settings/configuration', disabled: true }
            ]
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
