"use client";

import React, {
  createContext,
  type ComponentClass,
  createElement,
  type FC,
  type FunctionComponent,
  type ReactElement,
  type ReactNode,
  useState,
} from "react";
import {
  Dialog,
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { useToast } from "~/hooks/use-toast";
import { type FieldValues } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { type ToastProps } from "~/components/ui/toast";
import { cva } from "class-variance-authority";
import { cn } from "~/lib/utils";

interface ModalProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const buttonVariants = cva("max-h-[93vh]", {
  variants: {
    size: {
      sm: "max-w-[320px]",
      md: "max-w-[490px]",
      xl: "max-w-[800px]",
      "2xl": "max-w-[1000px]",
      lg: "max-w-[1200px]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface DialogProps<Params extends object = object>
  extends Pick<ModalProps, "size"> {
  title?: string;
  message?: string | ReactNode;
  params?: Params;
  handleAccept?: (data?: FieldValues) => Promise<void>;
  customComponent?: FunctionComponent<Params> | ComponentClass<Params>;
}

type ToastOptions = Omit<ToastProps, "id"> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
};

export interface DialogContextProps {
  open: (config: Omit<DialogProps, "customComponent" | "params">) => void;
  openConfirm: (config: Omit<DialogProps, "customComponent">) => void;
  openDeleteConfirm: (config: Pick<DialogProps, "handleAccept">) => void;
  openCustomComponent: <Props extends object = object>(
    component: FunctionComponent<Props> | FC<Props>,
    config: Omit<DialogProps<Props>, "message" | "customComponent">
  ) => void;
  close: () => void;
  closeAndEmit: (toastOptions?: ToastOptions, data?: FieldValues) => void;
}

export const DialogContext = createContext<DialogContextProps>(
  {} as DialogContextProps
);

export function DialogContextProvider({
  children,
}: {
  children: ReactElement;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const [modalProps, setModalProps] = useState<
    Omit<DialogProps, "customComponent"> & { custom?: boolean }
  >();
  const [customComponent, setCustomComponent] = useState<ReactNode | null>(
    null
  );
  const [modalSize, setModalSize] = useState<ModalProps["size"]>("md");
  const [sendingRequest, setSendingRequest] = useState(false);

  const handleOpen = (
    config: Omit<DialogProps, "customComponent" | "params">
  ) => {
    setModalProps(config);
    setIsOpen(true);
  };

  const handleOpenDeleteConfirm = (config: {
    handleAccept?: (data?: FieldValues) => Promise<void>;
  }) => {
    setModalProps({
      message: "Tem a certeza que deseja excluir?",
      title: "Confirma Deletar",
      handleAccept: config.handleAccept,
    });
    setModalSize("md");
    setIsOpen(true);
  };

  const handleOpenCustomComponent = <Props extends object = object>(
    component: FunctionComponent<Props>,
    config: Omit<DialogProps<Props>, "message" | "customComponent">
  ) => {
    setModalProps({
      ...config,
      custom: true,
      params: config.params as object,
      title: config.title,
      handleAccept: config.handleAccept,
    });

    setModalSize(config?.size ?? "md");
    setCustomComponent(createElement(component, config.params));
    setIsOpen(true);
  };

  const handleOpenConfirm = <Props extends object = object>(
    config: Omit<DialogProps<Props>, "customComponent">
  ) => {
    setModalProps({
      ...config,
    });
    setModalSize(config.size ?? "md");
    setIsOpen(true);
  };

  const handleClose = async (
    toastOptions?: ToastOptions,
    data?: FieldValues
  ) => {
    try {
      if (toastOptions) toast(toastOptions);
      setSendingRequest(true);
      await modalProps?.handleAccept?.(data);
      setTimeout(() => {
        setIsOpen(false);
        setModalProps({} as DialogProps);
        setCustomComponent(null);
      }, 1000);
      setSendingRequest(false);
    } catch {}
  };

  const close = () => {
    setIsOpen(false);
    setModalProps({} as DialogProps);
    setCustomComponent(null);
  };

  return (
    <DialogContext.Provider
      value={{
        open: handleOpen,
        openConfirm: handleOpenConfirm,
        openDeleteConfirm: handleOpenDeleteConfirm,
        openCustomComponent: handleOpenCustomComponent,
        close: close,
        closeAndEmit: handleClose,
      }}
    >
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          data-size={modalSize}
          className={cn(buttonVariants({ size: modalSize }))}
        >
          {modalProps?.custom ? (
            customComponent
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{modalProps?.title}</DialogTitle>
                <DialogDescription className="sr-only">
                  {modalProps?.message}
                </DialogDescription>
              </DialogHeader>
              <div>{modalProps?.message}</div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => handleClose()} disabled={sendingRequest}>
                  Confirmar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DialogContext.Provider>
  );
}
