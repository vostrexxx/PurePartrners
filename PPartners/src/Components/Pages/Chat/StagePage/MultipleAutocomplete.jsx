import React, { useEffect, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    TouchSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    horizontalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const MultipleAutocomplete = ({ notUsedRawStages, setSubStages }) => {
    const [selectedOptions, setSelectedOptions] = useState([]);

    useEffect(() => {
        console.log('notUsedRawStages', notUsedRawStages);
    }, [notUsedRawStages]);

    // Улучшенная настройка сенсоров для мобильных устройств
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Требует движения перед активацией
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor)
    );

    // Обработка окончания перетаскивания
    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over) return;

        if (active.id !== over.id) {
            const oldIndex = selectedOptions.findIndex((opt) => opt.elementId === active.id);
            const newIndex = selectedOptions.findIndex((opt) => opt.elementId === over.id);

            const newOptions = arrayMove(selectedOptions, oldIndex, newIndex);
            setSelectedOptions(newOptions);
            setSubStages(newOptions);
        }
    };

    // Удаление опции
    const handleRemove = (optionToRemove) => {
        const newOptions = selectedOptions.filter((opt) => opt.elementId !== optionToRemove.elementId);
        setSelectedOptions(newOptions);
        setSubStages(newOptions);
    };

    // Компонент одного перемещаемого тега
    const SortableTag = ({ option }) => {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
            isDragging,
        } = useSortable({
            id: option.elementId,
            // Отключаем сенсоры для дочерних элементов, чтобы не мешать удалению
            disabled: false
        });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.4 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#1976d2',
            color: 'white',
            padding: '4px 8px',
            margin: '4px 2px',
            borderRadius: '16px',
            fontSize: '0.875rem',
            cursor: 'move',
            userSelect: 'none',
            touchAction: 'none', // Предотвращает стандартные touch-действия
        };

        return (
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
            >
                <span style={{ marginRight: 6 }}>{option.subWorkCategoryName}</span>
                <span
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault(); // Предотвращает всплытие touch-событий
                        handleRemove(option);
                    }}
                    style={{
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        touchAction: 'manipulation' // Оптимизация для touch-устройств
                    }}
                >
                    ×
                </span>
            </div>
        );
    };

    return (
        <Autocomplete
            disableCloseOnSelect
            multiple
            options={notUsedRawStages || []}
            getOptionLabel={(option) => option.subWorkCategoryName || ''}
            getOptionKey={(option) => option.elementId}
            value={selectedOptions}
            onChange={(event, newValue) => {
                setSelectedOptions(newValue);
                setSubStages(newValue);
            }}
            renderTags={(value, getTagProps) => (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={value.map((opt) => opt.elementId)}
                        strategy={horizontalListSortingStrategy}
                    >
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 4,
                            touchAction: 'pan-y' // Разрешает вертикальный скролл
                        }}>
                            {value.map((option, index) => (
                                <SortableTag key={option.elementId} option={option} />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    label="Выберите этапы"
                    placeholder="Выберите..."
                />
            )}
            // Дополнительные пропсы для мобильной оптимизации
            ListboxComponent="div"
            ListboxProps={{
                style: {
                    maxHeight: '200px',
                    overflow: 'auto'
                }
            }}
        />
    );
};

export default MultipleAutocomplete;