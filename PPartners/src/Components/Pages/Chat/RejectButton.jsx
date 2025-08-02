import {Button} from 'react-bootstrap'; // Импортируем Button из Bootstrap
import {useNavigate} from 'react-router-dom';
import {useToast} from '../../Notification/ToastContext'

const RejectButton = ({agreementId, status}) => {
    const navigate = useNavigate();
    const showToast = useToast();
    const getAuthToken = () => localStorage.getItem('authToken');
    const url = localStorage.getItem('url');

    const handleReject = async () => {
        const bodyData = {
            newStatus: "Отклонено",
            agreementId,
        };

        try {
            const response = await fetch(`${url}/agreement`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
                body: JSON.stringify(bodyData),
            });

            if (!response.ok) {
                throw new Error(`Ошибка при отклонении: ${response.status}`);
            }

            showToast('Соглашение успешно отклонено', 'success');
            // navigate('/'); // Перенаправление на главную страницу или другую страницу
        } catch (error) {
            console.error('Ошибка при отклонении:', error);
            showToast('Не удалось отклонить соглашение', 'danger');
        }

    };

    return (
        <Button
            variant="danger" // Красный цвет для кнопки
            onClick={handleReject}
            className='mt-3 w-100'
            // disabled={status !== 'Переговоры'} // Отключаем кнопку, если статус не "Переговоры"
        >
            Отклонить
        </Button>
    );
};

export default RejectButton;