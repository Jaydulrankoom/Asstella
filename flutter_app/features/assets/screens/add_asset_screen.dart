import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';

class AddAssetScreen extends StatefulWidget {
  const AddAssetScreen({super.key});

  @override
  State<AddAssetScreen> createState() => _AddAssetScreenState();
}

class _AddAssetScreenState extends State<AddAssetScreen> {
  int _currentStep = 0;
  final _formKey = GlobalKey<FormState>();
  File? _image;

  // Form Controllers
  final _nameController = TextEditingController();
  final _serialController = TextEditingController();
  String? _selectedCategory;
  String? _selectedBranch;
  String? _selectedDept;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Register New Asset'),
      ),
      body: Form(
        key: _formKey,
        child: Stepper(
          type: StepperType.horizontal,
          currentStep: _currentStep,
          onStepContinue: () {
            if (_currentStep < 3) {
              setState(() => _currentStep++);
            } else {
              _submitForm();
            }
          },
          onStepCancel: () {
            if (_currentStep > 0) setState(() => _currentStep--);
          },
          steps: [
            Step(
              title: const Text('Info', style: TextStyle(fontSize: 12)),
              isActive: _currentStep >= 0,
              content: _buildBasicInfo(),
            ),
            Step(
              title: const Text('Purchase', style: TextStyle(fontSize: 12)),
              isActive: _currentStep >= 1,
              content: _buildPurchaseInfo(),
            ),
            Step(
              title: const Text('Location', style: TextStyle(fontSize: 12)),
              isActive: _currentStep >= 2,
              content: _buildLocationInfo(),
            ),
            Step(
              title: const Text('Finance', style: TextStyle(fontSize: 12)),
              isActive: _currentStep >= 3,
              content: _buildFinancialInfo(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBasicInfo() {
    return Column(
      children: [
        _buildImagePicker(),
        const SizedBox(height: 20),
        TextFormField(
          controller: _nameController,
          decoration: const InputDecoration(labelText: 'Asset Name*', prefixIcon: Icon(LucideIcons.package)),
          validator: (v) => v!.isEmpty ? 'Name is required' : null,
        ),
        const SizedBox(height: 16),
        DropdownButtonFormField<String>(
          value: _selectedCategory,
          decoration: const InputDecoration(labelText: 'Category*'),
          items: ['IT', 'Furniture', 'Vehicles'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
          onChanged: (val) => setState(() => _selectedCategory = val),
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _serialController,
          decoration: const InputDecoration(labelText: 'Serial Number', prefixIcon: Icon(LucideIcons.hash)),
        ),
      ],
    );
  }

  Widget _buildImagePicker() {
    return GestureDetector(
      onTap: _pickImage,
      child: Container(
        height: 120,
        width: 120,
        decoration: BoxDecoration(
          color: Colors.grey.shade100,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade300),
        ),
        child: _image == null 
          ? const Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(LucideIcons.camera, color: Colors.grey),
                Text('Add Photo', style: TextStyle(fontSize: 12, color: Colors.grey)),
              ],
            )
          : Stack(
              children: [
                ClipRRect(borderRadius: BorderRadius.circular(12), child: Image.file(_image!, fit: BoxFit.cover, width: 120, height: 120)),
                Positioned(top: 4, right: 4, child: CircleAvatar(radius: 12, backgroundColor: Colors.red, child: IconButton(icon: const Icon(Icons.close, size: 12, color: Colors.white), onPressed: () => setState(() => _image = null)))),
              ],
            ),
      ),
    );
  }

  Widget _buildPurchaseInfo() {
    return const Column(
      children: [
        TextField(decoration: InputDecoration(labelText: 'Purchase Value', prefixIcon: Icon(LucideIcons.dollarSign))),
        SizedBox(height: 16),
        TextField(decoration: InputDecoration(labelText: 'Purchase Date (YYYY-MM-DD)', prefixIcon: Icon(LucideIcons.calendar))),
        SizedBox(height: 16),
        TextField(decoration: InputDecoration(labelText: 'Vendor Name', prefixIcon: Icon(LucideIcons.building))),
      ],
    );
  }

  Widget _buildLocationInfo() {
    return Column(
      children: [
        DropdownButtonFormField<String>(
          value: _selectedBranch,
          decoration: const InputDecoration(labelText: 'Branch/Site'),
          items: ['HQ', 'Warehouse', 'New York Branch'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
          onChanged: (val) {
             setState(() {
               _selectedBranch = val;
               _selectedDept = null; // Cascade reset
             });
          },
        ),
        const SizedBox(height: 16),
        if (_selectedBranch != null)
          DropdownButtonFormField<String>(
            value: _selectedDept,
            decoration: const InputDecoration(labelText: 'Department'),
            items: ['Sales', 'IT', 'Operations'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
            onChanged: (val) => setState(() => _selectedDept = val),
          ),
      ],
    );
  }

  Widget _buildFinancialInfo() {
    return const Column(
      children: [
        DropdownButtonFormField<String>(
          decoration: InputDecoration(labelText: 'Depreciation Method'),
          items: [
            DropdownMenuItem(value: 'SL', child: Text('Straight Line')),
            DropdownMenuItem(value: 'RB', child: Text('Reducing Balance')),
          ],
          onChanged: null,
        ),
        SizedBox(height: 16),
        TextField(decoration: InputDecoration(labelText: 'Useful Life (Years)')),
        SizedBox(height: 16),
        TextField(decoration: InputDecoration(labelText: 'Salvage / Residual Value')),
      ],
    );
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) setState(() => _image = File(pickedFile.path));
  }

  void _submitForm() {
    if (_formKey.currentState!.validate()) {
      // API call to POST /assets
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Asset Registered Successfully!'), backgroundColor: Colors.emerald),
      );
      Navigator.pop(context);
    }
  }
}
