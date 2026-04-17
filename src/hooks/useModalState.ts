'use client';

import { useCallback, useState } from 'react';

interface ModalState {
	isOpen: boolean;
	open: () => void;
	close: () => void;
	toggle: () => void;
	setOpen: (open: boolean) => void;
}

interface MultiModalState {
	activeModal: string | null;
	openModal: (id: string) => void;
	closeModal: () => void;
	toggleModal: (id: string) => void;
	isOpen: (id: string) => boolean;
}

export function useModalState(initial = false): ModalState {
	const [isOpen, setIsOpen] = useState(initial);

	const open = useCallback(() => setIsOpen(true), []);
	const close = useCallback(() => setIsOpen(false), []);
	const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
	const setOpen = useCallback((open: boolean) => setIsOpen(open), []);

	return { isOpen, open, close, toggle, setOpen };
}

export function useMultiModalState(initialActive?: string): MultiModalState {
	const [activeModal, setActiveModal] = useState<string | null>(initialActive ?? null);

	const openModal = useCallback((id: string) => setActiveModal(id), []);
	const closeModal = useCallback(() => setActiveModal(null), []);
	const toggleModal = useCallback(
		(id: string) => setActiveModal((prev) => (prev === id ? null : id)),
		[]
	);
	const isOpen = useCallback((id: string) => activeModal === id, [activeModal]);

	return { activeModal, openModal, closeModal, toggleModal, isOpen };
}

export default { useModalState, useMultiModalState };
