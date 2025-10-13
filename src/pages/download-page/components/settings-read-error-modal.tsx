import { useEffect, useState } from "react";
import { getStore } from "../../../store/global-stores";
import { File, Settings } from "../../../lib/fs/settings";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";

export const SettingsReadErrorModal = () => {
  const useStore = getStore((s) => s.boot);
  const result = useStore((s) => s.readSettings.value);
  const [isOpen, setIsOpen] = useState(!!result);
  const [isFixed, setIsFixed] = useState(false);
  const [couldNotFix, setCouldNotFix] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const onClose = () => {
    setIsOpen(false);
    useStore.getState().readSettings.setValue(null);
  };
  const onReplace = () => {
    setIsFixing(true);
  };

  useEffect(() => {
    let isMounted = true;

    if (isFixing) {
      setTimeout(() => {
        File.write(new Settings())
          .then(() => {
            if (isMounted) {
              const store = getStore((s) => s.boot.getState());
              store.readSettings.setValue(null);
              setIsFixed(true);
            }
          })
          .catch(() => {
            if (isMounted) {
              setCouldNotFix(true);
            }
          })
          .finally(() => {
            setIsFixing(false);
          });
      }, 1000);
    }

    return () => {
      isMounted = false;
    };
  }, [isFixing]);

  return (
    <Modal
      isDismissable={false}
      isKeyboardDismissDisabled={false}
      isOpen={isOpen}
      onClose={onClose}
      hideCloseButton
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Damaged settings!
        </ModalHeader>
        <ModalBody>
          {couldNotFix ? (
            <div>
              <div>
                There was an error when trying to update the settings file. It's
                not essential, so you can use the application anyway, but any
                changes you apply to your settings may not be saved.
              </div>
              <Button color="danger" onPress={() => setIsOpen(false)}>
                {"OK :("}
              </Button>
            </div>
          ) : isFixed ? (
            <div>
              <div>
                Your settings have been successfully reverted back to their
                default state.
              </div>
            </div>
          ) : !isFixing && !isFixed ? (
            <p>
              Something went wrong when reading the settings file. We can try
              replacing the file for you, but you will loose any settings that
              you've specified.
            </p>
          ) : (
            isFixing && !isFixed && <div>Fixing problem...</div>
          )}
        </ModalBody>
        <ModalFooter>
          {!isFixing && !isFixed ? (
            <>
              <Button color="danger" variant="light" onPress={onClose}>
                Ignore
              </Button>
              <Button color="primary" onPress={onReplace}>
                Fix it
              </Button>
            </>
          ) : (
            isFixed && (
              <Button color="primary" onPress={() => setIsOpen(false)}>
                OK
              </Button>
            )
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
