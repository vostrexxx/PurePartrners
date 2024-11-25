package partners.agreement_connection_info.config;


import lombok.Getter;

@Getter
public enum ConnectionStatus {
    PENDING("В ожидании"),
    REJECTED("Отклонено"),
    NEGOTIATING("Переговоры"),
    ACCEPTED("Принято"),
    IN_WORK("В работе"),
    COMPLETED("Выполнено");


    private final String russianName;

    ConnectionStatus(String russianName) {
        this.russianName = russianName;
    }

    public static ConnectionStatus fromRussianName(String russianName) {
        for (ConnectionStatus status : ConnectionStatus.values()) {
            if (russianName.equals(status.russianName)) {
                return status;
            }
        }
        return null;
    }

    public static ConnectionStatus fromConnectionStatus(String connectionStatus) {
        for (ConnectionStatus status : ConnectionStatus.values()) {
            if (status.name().equals(connectionStatus)) {
                return status;
            }
        }
        return null;
    }
}
