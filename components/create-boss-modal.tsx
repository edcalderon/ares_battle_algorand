import React from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "@nextui-org/react";
import CreateBossCard from "@/components/create-boss-card";

export default function CreateBossModal({ isOpen, onClose }: any) {


    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    <ModalHeader>Add New Boss</ModalHeader>
                    <ModalBody>
                        <CreateBossCard />
                    </ModalBody>
                    <ModalFooter />
                </ModalContent>
            </Modal>
        </>
    );
}