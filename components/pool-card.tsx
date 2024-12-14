'use client'
import React from 'react'
import { Card, CardBody, CardFooter, Image } from "@nextui-org/react"
import { fakerDE as faker } from '@faker-js/faker';
import { useRouter } from 'next/navigation';
import {useLocale} from 'next-intl';

export const PoolCard = ({ item }: any) => {
    const genRanHex = (size: number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    const genRanRgb = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
    const img = `https://www.thecolorapi.com/id?format=svg&named=false&hex=${genRanHex(6)}` //faker.image.avatarGitHub()
    const router = useRouter()
    const locale = useLocale();

    return (
        <Card shadow="sm" key={item.id} isPressable onPress={() => router.push(`/${locale}/pools/${item.id}`)}>
            <CardBody className="overflow-visible p-0">
                <Image
                    shadow="sm"
                    radius="lg"
                    width="100%"
                    alt={item.id}
                    className="w-full object-cover h-[140px]"
                    src={img}
                />
            </CardBody>
            <CardFooter className="text-small justify-between">
                <b>{item.id}</b>
                <p className="text-default-500">$200{item.price}</p>
            </CardFooter>
        </Card>
    )
}
