import React, {
  FunctionComponent,
  useState,
  useEffect,
  ReactElement,
  useContext,
} from 'react';
import { useParams } from 'react-router-dom';

/* Components */
import {
  EuiDragDropContext,
  EuiDroppable,
  EuiDraggable,
  euiDragDropReorder,
} from '@elastic/eui';
import { TwitchSidebar } from '../TwitchSidebar/TwitchSidebar';

/* Styles */
import './_guide-detail-view.scss';

/* Types */
import { Guide } from '../../models/Guide';

/* Constants */
import { newSection } from '../../constants/constants';
import { GuideDetailSideNav } from './GuideDetailSideNav/GuideDetailSideNav';
import { GuideDetailSection } from './GuideDetailSection/GuideDetailSection';
import { GuideDetailHeader } from './GuideDetailHeader/GuideDetailHeader';

/* Firebase */
import { Context } from '../../store/Store';

/* Services */
import { ToastService } from '../../services/ToastService';
import GuideService from '../../services/GuideService/GuideService';

export interface GuideDetailViewProps {}

export const GuideDetailView: FunctionComponent<GuideDetailViewProps> =
  (): ReactElement => {
    const [editing, setEditing] = useState<boolean>(false);
    const [collapsed, setCollapsed] = useState<Array<boolean>>(
      Array<boolean>(),
    );
    const [guide, setGuide] = useState<Guide | null>(null);
    const [state] = useContext(Context);
    const { cookbook, user } = state;
    const guideId = useParams().recipe;
    const toast = new ToastService();
    const showControls = user && cookbook.roles[user.uid] === 'admin';
    const guideService = new GuideService(cookbook._id);

    const getGuide = async () => {
      const guide: any = await guideService.getById(guideId);
      setGuide(guide);
    };

    useEffect(() => {
      getGuide();
    }, []);

    const updateSection = (key, value, index) => {
      if (!guide) return;
      guide.sections[index][key] = value;
      setGuide({ ...guide });
    };

    const handleSetEditing = (isEditing) => {
      setEditing(isEditing);
    };

    const handleAddSection = () => {
      if (!guide) return;
      const { sections } = guide;
      sections.unshift({ ...newSection });
      collapsed.unshift(false);
      setCollapsed([...collapsed]);
      setGuide({ ...guide });
    };

    const handleCancel = async () => {
      await getGuide();
      setCollapsed(Array(guide?.sections.length).fill(false));
      setEditing(false);
    };

    const handleDelete = (index) => {
      if (!guide) return;
      const { sections } = guide;
      setCollapsed(
        collapsed
          .slice(0, index)
          .concat(collapsed.slice(index + 1, collapsed.length)),
      );
      guide.sections = sections
        .slice(0, index)
        .concat(sections.slice(index + 1, sections.length));
      setGuide({ ...guide });
    };

    const handleSave = async () => {
      if (!guide) return;
      try {
        const token = await user.user.getIdToken();
        await guideService.update(
          guide._id,
          { sections: guide.sections },
          {
            Authorization: `Bearer ${token}`,
          },
        );
        toast.successToast('Guide saved!', 'Guide saved');
        setCollapsed(Array(guide.sections.length).fill(false));
        await getGuide();
        setEditing(false);
      } catch (error) {
        toast.errorToast('Something went wrong', 'Guide was not saved');
      }
    };

    const handleCollapse = (index) => {
      collapsed[index] = collapsed[index] ? !collapsed[index] : true;
      setCollapsed([...collapsed]);
    };

    const handleDragEnd = (result) => {
      const { source, destination } = result;
      if (!guide) return;
      const { sections } = guide;
      if (source && destination) {
        const items = euiDragDropReorder(
          sections,
          source.index,
          destination.index,
        );
        setCollapsed([
          ...euiDragDropReorder(collapsed, source.index, destination.index),
        ]);
        guide.sections = [...items];
        setGuide({ ...guide });
      }
    };

    const buildSections = () => {
      if (!guide) return [<></>];

      return guide.sections.map((section, index) => {
        const { title, body, tags } = section;
        const isCollapsed = collapsed[index] && collapsed[index] === true;

        return editing ? (
          <EuiDraggable
            spacing="m"
            key={index}
            index={index}
            draggableId={index.toString()}
            isDragDisabled={!editing}
          >
            <GuideDetailSection
              title={title}
              body={body}
              index={index}
              editing={editing}
              tags={tags}
              isCollapsed={isCollapsed}
              handleCollapse={handleCollapse}
              handleDelete={handleDelete}
              updateSection={updateSection}
            />
          </EuiDraggable>
        ) : (
          <GuideDetailSection
            title={title}
            body={body}
            index={index}
            editing={editing}
            tags={tags}
            isCollapsed={isCollapsed}
            handleCollapse={handleCollapse}
            handleDelete={handleDelete}
            updateSection={updateSection}
          />
        );
      });
    };

    return (
      <div id="guide-detail" className="guide-detail">
        {guide && guide.sections && (
          <>
            {
              <div
                className="guide-detail__header"
                style={editing ? { paddingRight: 8 } : {}}
              >
                <GuideDetailHeader
                  editing={editing}
                  handleCancel={handleCancel}
                  handleSave={handleSave}
                  handleAddSection={handleAddSection}
                  handleSetEditing={handleSetEditing}
                  sections={guide.sections}
                  title={guide.title}
                  character={guide.character}
                  showControls={showControls}
                />
              </div>
            }

            <div className="guide-detail__content">
              <GuideDetailSideNav
                editing={editing}
                title={guide.title}
                sections={guide.sections}
                character={guide.character}
                handleDragEnd={handleDragEnd}
              />
              <div id="sections" className="guide-content__sections">
                {editing ? (
                  <EuiDragDropContext onDragEnd={handleDragEnd}>
                    <EuiDroppable
                      droppableId="DROPPABLE_AREA"
                      spacing="m"
                      className="guide-content__droppable"
                    >
                      {buildSections()}
                    </EuiDroppable>
                  </EuiDragDropContext>
                ) : (
                  buildSections()
                )}
              </div>
              <TwitchSidebar
                className={
                  editing
                    ? 'guide-content__right editing'
                    : 'guide-content__right'
                }
              />
            </div>
          </>
        )}
      </div>
    );
  };
