class SessionModel {
  final String id;
  final String trainerName;
  final String status;
  final String scheduledTime;

  SessionModel({
    required this.id,
    required this.trainerName,
    required this.status,
    required this.scheduledTime,
  });

  factory SessionModel.fromJson(Map<String, dynamic> json) {
    return SessionModel(
      id: json['_id'] ?? '',
      trainerName: json['trainerName'] ?? 'Trainer',
      status: json['status'] ?? 'PENDING',
      scheduledTime: json['scheduledTime'] ?? '',
    );
  }
}
