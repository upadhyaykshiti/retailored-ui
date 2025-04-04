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
                { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' },
                { label: 'Companies', icon: 'pi pi-fw pi-building', to: '/pages/companies'},
                { label: 'Customers', icon: 'pi pi-fw pi-users', to: '/pages/customer/customer-list'},
                { label: 'Garments', icon: 'pi pi-fw pi-box', to: '/pages/garments'},
                { label: 'Orders', icon: 'pi pi-fw pi-shopping-cart', to: '/pages/orders/pending-orders'}
            ]
        },
        {
            label: 'Support',
            items: [
                { label: 'Help Centre', icon: 'pi pi-fw pi-question-circle', to: '/help', disabled: true },
                { label: 'VIP Customer Support', icon: 'pi pi-fw pi-star', to: '/vip-support', disabled: true },
                { label: 'FAQs', icon: 'pi pi-fw pi-info-circle', to: '/faqs', disabled: true }
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
