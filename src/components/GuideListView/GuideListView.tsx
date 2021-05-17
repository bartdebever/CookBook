import React, {
  FunctionComponent,
  useContext,
  useState,
  useEffect,
} from "react";

/* Models */
import { Guide } from "../../models/Guide";
import { Tag } from "../../models/Tag";

/* Components */
import { GuideCard } from "./GuideCard/GuideCard";
import {
  EuiButton,
  EuiButtonEmpty,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiConfirmModal,
  EuiModalHeaderTitle,
  EuiTextArea,
  EuiSearchBar,
  EuiButtonIcon,
} from "@elastic/eui";

import { TagInput } from "../TagInput/TagInput";

/* Styles */
import "./_guide-list-view.scss";
import { CharacterSelect } from "../CharacterSelect/CharacterSelect";

/* Context */
import { Firebase, FirebaseContext } from "../../firebase";
import { Context } from "../../store/Store";

/* Constants */
import { CHARACTERS, FIRESTORE } from "../../constants/constants";

/* Services */
import { ToastService } from "../../services/ToastService";

export interface GuideListViewProps {}

const emptyGuide: Guide = {
  title: "",
  description: "",
  character: null,
  sections: [],
  tags: [],
};
export interface AddForm {
  title?: string;
  description?: string;
  character?: string;
  tags?: Array<Tag>;
}

export const GuideListView: FunctionComponent<GuideListViewProps> = () => {
  const [state] = useContext(Context);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [showDelete, setShowDelete] = useState<boolean>(false);
  const [guide, setGuide] = useState<Guide>(emptyGuide);
  const [creating, setCreating] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(true);
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const firebase = useContext<Firebase | null>(FirebaseContext);
  const { cookbook, user } = state;
  const toast = new ToastService();

  const getGuides = async () => {
    return await firebase?.getAll(cookbook.id, FIRESTORE.collections.guides);
  };

  useEffect(() => {
    async function init() {
      try {
        setGuides(await getGuides());
      } catch (err) {
        toast.errorToast("Error getting guides", err.message);
      }
    }
    init();
  }, []);

  const deletePrompt = async (e, guide) => {
    e.stopPropagation();
    setGuide(guide);
    setShowDelete(true);
  };

  const deleteGuide = async () => {
    if (!guide) return;
    try {
      await firebase?.deleteDocById(
        cookbook.id,
        FIRESTORE.collections.guides,
        guide.id
      );
      setGuides(await getGuides());
      toast.successToast(
        "Guide deleted",
        `guide ${guide.title} has been deleted`
      );
    } catch (error) {
      toast.errorToast("Guide failed to be deleted", error.msg);
    } finally {
      setShowDelete(false);
      setGuide(emptyGuide);
    }
  };

  const handleEdit = async (event, guide) => {
    event.stopPropagation();
    setGuide(guide);
    setShowEdit(true);
  };

  const destroyModal = (
    <EuiConfirmModal
      title={`Delete guide "${guide ? guide.title : ""}"?`}
      onCancel={() => setShowDelete(false)}
      onConfirm={deleteGuide}
      cancelButtonText="Cancel"
      confirmButtonText="Delete"
      buttonColor="danger"
      defaultFocusedButton="confirm"
    >
      <p>You&rsquo;re about to delete this guide permanently</p>
    </EuiConfirmModal>
  );

  const guideForm = (
    <EuiForm id="guideForm" component="form">
      <EuiFormRow label="Title">
        <EuiFieldText
          value={guide.title}
          required
          onChange={(e) => setGuide({ ...guide, ...{ title: e.target.value } })}
        />
      </EuiFormRow>
      <EuiFormRow label="Description (optional)">
        <EuiTextArea
          resize="none"
          value={guide.description || ""}
          onChange={(e) =>
            setGuide({ ...guide, ...{ description: e.target.value } })
          }
        />
      </EuiFormRow>
      <EuiFormRow label="Select Character (optional)">
        <CharacterSelect
          onChange={(value) => setGuide({ ...guide, ...{ character: value } })}
          value={guide.character}
        />
      </EuiFormRow>
      <EuiFormRow label="Tags (optional)">
        <TagInput
          initialTags={guide.tags}
          handleUpdate={(tags) => setGuide({ ...guide, ...{ tags: tags } })}
        />
      </EuiFormRow>
    </EuiForm>
  );

  const createGuide = async (newGuide) => {
    const { character, description, tags, title } = newGuide;
    try {
      await firebase?.add(cookbook.id, FIRESTORE.collections.guides, {
        character,
        description,
        sections: [],
        tags,
        title,
      });
      toast.successToast(
        guide.title,
        "Guide succesfully created",
        character ? CHARACTERS[character] : null
      );
    } catch (err) {
      toast.errorToast("Failed to create guide", err.message);
    }
  };

  const handleNewSave = async (event) => {
    event?.preventDefault();
    try {
      setCreating(true);
      await createGuide(guide);
      setGuides(
        await firebase?.getAll(cookbook.id, FIRESTORE.collections.guides)
      );
      setGuide(emptyGuide);
      setShowAdd(false);
    } finally {
      setCreating(false);
    }
  };

  const handleEditSave = async (event) => {
    try {
      setCreating(true);
      await guide.doc_ref.set(guide);
      toast.successToast("Guide Updated", `Edited guide: ${guide.title}`);
      setGuides(
        await firebase?.getAll(cookbook.id, FIRESTORE.collections.guides)
      );
    } finally {
      setGuide(emptyGuide);
      setShowEdit(false);
      setCreating(false);
    }
  };

  const handleCancel = () => {
    setShowAdd(false);
    setShowEdit(false);
    setGuide(emptyGuide);
  };

  const buildGuides = () => {
    return guides.map((guide, index) => {
      return (
        <GuideCard
          guide={guide}
          key={index}
          editing={editing}
          handleDelete={(event, guide) => deletePrompt(event, guide)}
          handleEdit={(event, guide) => handleEdit(event, guide)}
        />
      );
    });
  };

  const Modal = (title, save) => {
    return (
      <EuiModal onClose={handleCancel} initialFocus="[name=popswitch]">
        <EuiModalHeader>
          <EuiModalHeaderTitle>
            <h1>{title}</h1>
          </EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiModalBody>{guideForm}</EuiModalBody>
        <EuiModalFooter>
          <EuiButtonEmpty onClick={handleCancel}>Cancel</EuiButtonEmpty>
          <EuiButton
            type="submit"
            form="guideForm"
            onClick={save}
            fill
            disabled={!guide.title || guide.title.length === 0}
            isLoading={creating}
          >
            Save
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    );
  };

  return (
    <div className="guide-list">
      <div className="guide-list__controls">
        <EuiSearchBar onChange={() => {}} />
        {user && cookbook.roles[user.uid] === "admin" && (
          <EuiButtonIcon
            aria-label="add"
            className="guide-controls__button"
            display="fill"
            iconType="plus"
            color="success"
            size="m"
            onClick={() => {
              setShowAdd(true);
            }}
          >
            Create
          </EuiButtonIcon>
        )}

        {showAdd === true && firebase && Modal("Add Guide", handleNewSave)}
        {showDelete && destroyModal}
        {showEdit && Modal("Edit Guide", handleEditSave)}
      </div>
      <div className="guide-list__content">{buildGuides()}</div>
    </div>
  );
};
