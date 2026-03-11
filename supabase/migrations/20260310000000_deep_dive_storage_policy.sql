-- Policy to allow users to read their own reports
CREATE POLICY "Users can download their own reports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'deep-dive-reports'
  AND name LIKE 'deep-dive-' || auth.uid()::text || '-%'
);
