class SessionModel {
  final String id;
  final String clientName;
  final String status;
  final String scheduledTime;

  SessionModel({
    required this.id,
    required this.clientName,
    required this.status,
    required this.scheduledTime,
  });

  factory SessionModel.fromJson(Map<String, dynamic> json) {
    return SessionModel(
      id: json['_id'] ?? '',
      clientName: json['clientName'] ?? 'Client',
      status: json['status'] ?? 'PENDING',
      scheduledTime: json['scheduledTime'] ?? '',
    );
  }
}
