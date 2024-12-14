import React from 'react'
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
import { HomeIcon } from '@heroicons/react/20/solid';

export const Breadcrumb = ({ path }: any) => {
    const pathArray = path.toString().split('/')
    //console.log(pathArray)

    return (
        <Breadcrumbs
            separator="/"
            itemClasses={{
                separator: "px-2"
            }}
        >
            <BreadcrumbItem href="/" startContent={<HomeIcon className="h-4 w-4" aria-hidden="true" />}>Home</BreadcrumbItem>
            {pathArray.map((el: string) => {
                if (el != '') {
                    return (
                        <BreadcrumbItem href=''>{el}</BreadcrumbItem>
                    )
                }

            })}
        </Breadcrumbs>
    )
}
