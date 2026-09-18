class SessionModel {
  final String id;
  final String trainerId;
  final String clientId;
  final String clientName;
  final String dogName;
  final String address;
  final double clientLat;
  final double clientLng;
  final DateTime scheduledStartTime;
  final String status;

  SessionModel({
    required this.id,
    required this.trainerId,
    required this.clientId,
    required this.clientName,
    required this.dogName,
    required this.address,
    required this.clientLat,
    required this.clientLng,
    required this.scheduledStartTime,
    required this.status,
  });

  factory SessionModel.fromJson(Map<String, dynamic> json) {
    return SessionModel(
      id: json['_id'] ?? '',
      trainerId: json['trainerId'] ?? '',
      clientId: json['clientId']['_id'] ?? '',
      clientName: json['clientId']['fullName'] ?? 'Client',
      dogName: json['clientId']['activePackage']['dogName'] ?? 'Dog',
      address: json['clientId']['homeLocation']['address'] ?? '',
      clientLat: (json['clientId']['homeLocation']['latitude'] ?? 0.0).toDouble(),
      clientLng: (json['clientId']['homeLocation']['longitude'] ?? 0.0).toDouble(),
      scheduledStartTime: DateTime.parse(json['scheduledStartTime']),
      status: json['status'] ?? 'SCHEDULED',
    );
  }
}
