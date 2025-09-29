import 'package:flutter/material.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';

class FeedbackScreen extends StatefulWidget {
  const FeedbackScreen({super.key});

  @override
  State<FeedbackScreen> createState() => _FeedbackScreenState();
}

class _FeedbackScreenState extends State<FeedbackScreen> {
  final _formKey = GlobalKey<FormState>();
  final _treatmentController = TextEditingController();
  final _textFeedbackController = TextEditingController();
  
  int _selectedDoctorId = 0;
  double _preTreatmentRating = 0;
  double _postTreatmentRating = 0;
  double _satisfactionRating = 0;
  bool _isLoading = false;

  final List<Map<String, dynamic>> _doctors = [
    {'id': 1, 'name': 'Dr. Sarah Johnson', 'specialty': 'Cardiology'},
    {'id': 2, 'name': 'Dr. Michael Chen', 'specialty': 'Neurology'},
    {'id': 3, 'name': 'Dr. Emily Davis', 'specialty': 'Pediatrics'},
    {'id': 4, 'name': 'Dr. Robert Wilson', 'specialty': 'Orthopedics'},
  ];

  @override
  void dispose() {
    _treatmentController.dispose();
    _textFeedbackController.dispose();
    super.dispose();
  }

  Future<void> _submitFeedback() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedDoctorId == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select a doctor'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    final apiService = Provider.of<ApiService>(context, listen: false);
    final result = await apiService.submitFeedback(
      patientId: 1, // This would come from user session
      doctorId: _selectedDoctorId,
      treatmentDescription: _treatmentController.text.trim().isEmpty 
          ? null 
          : _treatmentController.text.trim(),
      preTreatmentRating: _preTreatmentRating.toInt(),
      postTreatmentRating: _postTreatmentRating.toInt(),
      satisfactionRating: _satisfactionRating.toInt(),
      textFeedback: _textFeedbackController.text.trim().isEmpty 
          ? null 
          : _textFeedbackController.text.trim(),
    );

    setState(() => _isLoading = false);

    if (result != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Feedback submitted successfully!'),
          backgroundColor: Colors.green,
        ),
      );
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to submit feedback. Please try again.'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Submit Feedback'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Doctor Selection
              const Text(
                'Select Doctor',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<int>(
                value: _selectedDoctorId == 0 ? null : _selectedDoctorId,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  hintText: 'Choose a doctor',
                ),
                items: _doctors.map((doctor) {
                  return DropdownMenuItem<int>(
                    value: doctor['id'],
                    child: Text('${doctor['name']} - ${doctor['specialty']}'),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() => _selectedDoctorId = value ?? 0);
                },
                validator: (value) {
                  if (value == null || value == 0) {
                    return 'Please select a doctor';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),

              // Treatment Description
              const Text(
                'Treatment Description (Optional)',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _treatmentController,
                maxLines: 3,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  hintText: 'Describe the treatment you received...',
                ),
              ),
              const SizedBox(height: 24),

              // Pre-Treatment Rating
              const Text(
                'How did you feel before treatment?',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              RatingBar.builder(
                initialRating: _preTreatmentRating,
                minRating: 1,
                direction: Axis.horizontal,
                allowHalfRating: false,
                itemCount: 5,
                itemPadding: const EdgeInsets.symmetric(horizontal: 4.0),
                itemBuilder: (context, _) => const Icon(
                  Icons.star,
                  color: Colors.amber,
                ),
                onRatingUpdate: (rating) {
                  setState(() => _preTreatmentRating = rating);
                },
              ),
              const SizedBox(height: 24),

              // Post-Treatment Rating
              const Text(
                'How do you feel after treatment?',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              RatingBar.builder(
                initialRating: _postTreatmentRating,
                minRating: 1,
                direction: Axis.horizontal,
                allowHalfRating: false,
                itemCount: 5,
                itemPadding: const EdgeInsets.symmetric(horizontal: 4.0),
                itemBuilder: (context, _) => const Icon(
                  Icons.star,
                  color: Colors.amber,
                ),
                onRatingUpdate: (rating) {
                  setState(() => _postTreatmentRating = rating);
                },
              ),
              const SizedBox(height: 24),

              // Satisfaction Rating
              const Text(
                'Overall satisfaction with the service?',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              RatingBar.builder(
                initialRating: _satisfactionRating,
                minRating: 1,
                direction: Axis.horizontal,
                allowHalfRating: false,
                itemCount: 5,
                itemPadding: const EdgeInsets.symmetric(horizontal: 4.0),
                itemBuilder: (context, _) => const Icon(
                  Icons.star,
                  color: Colors.amber,
                ),
                onRatingUpdate: (rating) {
                  setState(() => _satisfactionRating = rating);
                },
              ),
              const SizedBox(height: 24),

              // Text Feedback
              const Text(
                'Additional Comments (Optional)',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _textFeedbackController,
                maxLines: 4,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  hintText: 'Share your thoughts about the treatment...',
                ),
              ),
              const SizedBox(height: 32),

              // Submit Button
              ElevatedButton(
                onPressed: _isLoading ? null : _submitFeedback,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF3B82F6),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text(
                        'Submit Feedback',
                        style: TextStyle(fontSize: 16),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
