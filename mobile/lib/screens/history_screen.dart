import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  List<Map<String, dynamic>> _feedbackHistory = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadFeedbackHistory();
  }

  Future<void> _loadFeedbackHistory() async {
    setState(() => _isLoading = true);
    
    final apiService = Provider.of<ApiService>(context, listen: false);
    final history = await apiService.getFeedbackHistory();
    
    setState(() {
      _feedbackHistory = history;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Feedback History'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadFeedbackHistory,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _feedbackHistory.isEmpty
              ? const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.feedback_outlined,
                        size: 64,
                        color: Colors.grey,
                      ),
                      SizedBox(height: 16),
                      Text(
                        'No feedback submitted yet',
                        style: TextStyle(
                          fontSize: 18,
                          color: Colors.grey,
                        ),
                      ),
                      SizedBox(height: 8),
                      Text(
                        'Submit your first feedback to see it here',
                        style: TextStyle(
                          color: Colors.grey,
                        ),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16.0),
                  itemCount: _feedbackHistory.length,
                  itemBuilder: (context, index) {
                    final feedback = _feedbackHistory[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 16),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Dr. ${feedback['doctorName'] ?? 'Unknown'}',
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: _getTESColor(feedback['treatmentEvaluationScore']),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    'TES: ${feedback['treatmentEvaluationScore']?.toStringAsFixed(1) ?? 'N/A'}%',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            if (feedback['treatmentDescription'] != null)
                              Text(
                                feedback['treatmentDescription'],
                                style: const TextStyle(
                                  color: Colors.grey,
                                  fontSize: 14,
                                ),
                              ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                _buildRatingChip(
                                  'Pre: ${feedback['preTreatmentRating'] ?? 'N/A'}',
                                  Icons.arrow_upward,
                                  Colors.blue,
                                ),
                                const SizedBox(width: 8),
                                _buildRatingChip(
                                  'Post: ${feedback['postTreatmentRating'] ?? 'N/A'}',
                                  Icons.arrow_downward,
                                  Colors.green,
                                ),
                                const SizedBox(width: 8),
                                _buildRatingChip(
                                  'Satisfaction: ${feedback['satisfactionRating'] ?? 'N/A'}',
                                  Icons.star,
                                  Colors.orange,
                                ),
                              ],
                            ),
                            if (feedback['textFeedback'] != null) ...[
                              const SizedBox(height: 12),
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: Colors.grey[100],
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  feedback['textFeedback'],
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontStyle: FontStyle.italic,
                                  ),
                                ),
                              ),
                            ],
                            const SizedBox(height: 12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Submitted: ${_formatDate(feedback['createdAt'])}',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey,
                                  ),
                                ),
                                if (feedback['sentimentAnalysis'] != null)
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 8,
                                      vertical: 4,
                                    ),
                                    decoration: BoxDecoration(
                                      color: _getSentimentColor(feedback['sentimentAnalysis']),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      feedback['sentimentAnalysis'],
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }

  Widget _buildRatingChip(String label, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Color _getTESColor(double? tes) {
    if (tes == null) return Colors.grey;
    if (tes >= 80) return Colors.green;
    if (tes >= 60) return Colors.orange;
    return Colors.red;
  }

  Color _getSentimentColor(String? sentiment) {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return Colors.green;
      case 'negative':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _formatDate(String? dateString) {
    if (dateString == null) return 'Unknown';
    try {
      final date = DateTime.parse(dateString);
      return '${date.day}/${date.month}/${date.year}';
    } catch (e) {
      return 'Unknown';
    }
  }
}
